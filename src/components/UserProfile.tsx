import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAuth, signOut, User } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserData {
  name: string;
  email: string;
  photoURL: string;
}

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse flex flex-col items-center space-y-4">
    <div className="w-24 h-24 rounded-full bg-gray-300"></div>
    <div className="w-32 h-5 bg-gray-300 rounded-md"></div>
    <div className="w-64 h-5 bg-gray-300 rounded-md"></div>
    <div className="w-32 h-10 bg-gray-300 rounded-md"></div>
  </div>
);

const UserProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery<UserData>("userData", async () => {
    if (!auth.currentUser) throw new Error("No user logged in");
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      const defaultUserData: UserData = {
        name: auth.currentUser.displayName || "Anonymous",
        email: auth.currentUser.email || "",
        photoURL: auth.currentUser.photoURL || "",
      };
      await setDoc(doc(db, "users", auth.currentUser.uid), defaultUserData);
      return defaultUserData;
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        queryClient.invalidateQueries("userData");
      }
    });

    return () => unsubscribe();
  }, [auth, queryClient]);

  const uploadMutation = useMutation(
    async (file: File) => {
      if (!auth.currentUser) throw new Error("No user logged in");
      const storageRef = ref(storage, `userPhotos/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: downloadURL,
      });
      return downloadURL;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("userData");
      },
    }
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      queryClient.clear();
      // Redirect to login page or update app state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <SkeletonLoader />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    console.error("Error fetching user data:", error);
  }

  const userInitial = userData?.name ? userData.name[0].toUpperCase() : "?";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={userData?.photoURL} alt={userData?.name} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 ">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 ring-4 ring-offset ring-[#7B1984]">
              <AvatarImage src={userData?.photoURL} alt={userData?.name} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer text-[#7B1984] "
            >
              Change Profile Picture
            </label>
          </div>
          <div className="flex flex-col justify-center items-center">
            <h3 className="font-semibold">Name</h3>
            <p>{userData?.name || "N/A"}</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <h3 className="font-semibold">Email</h3>
            <p>{userData?.email || "N/A"}</p>
          </div>
          <div className="flex items-center justify-center">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="rounded-full w-1/3 bg-[#7B1984]"
            >
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
