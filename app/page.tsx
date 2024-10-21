'use client'
import { useRouter } from "@/node_modules/next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // router.replace('/garden');
  }, [router]);

  return (
    <>
      <div className="flex flex-1 flex-col bg-reno-sand-200 text-black"> 
      <div className="mx-4 mb-4">The home page isn&apos;t done yet! Check out these other pages in the meantime.</div>
      <div className="mx-4">
        <Link
          href={"/garden"}
        >
        <p>Go to Garden Page</p>
        </Link>
      </div>
      <div className="mx-4">
        <Link
          href={"/store"}
        >
        <p>Go to Store Page</p>
        </Link>
      </div>
      <div className="mx-4">
        <Link
          href={"/user"}
        >
        <p>Go to User Page</p>
        </Link>
      </div>
      </div>
    </>
  );
}

export default HomePage;