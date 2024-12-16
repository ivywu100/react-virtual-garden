"use client";
import { useRouter } from "@/node_modules/next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import honkLogo from "../assets/svg/homePage/duck.svg";
import Image from "next/image";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // router.replace('/garden');
  }, [router]);

  return (
    <div class="mx-auto w-full min-h-screen pt-4 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 inset-0 bg-gradient-to-r from-blue-400 to-blue-500 overflow-hidden relative">
      <div class="relative flex flex-col items-center justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24 xl:pt-28 pb-8 space-y-6">
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white -mt-20 font-serif tracking-wider">
          VIRTUAL
        </h1>
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white -mt-10 font-serif tracking-wider">
          GARDEN
        </h1>

        <div class="pt-8">
          <Link
            href="/login"
            class="px-10 py-4 text-2xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:animate-gradient-x pt-4"
          >
            Play
          </Link>
        </div>
      </div>

      <section class="bg-white py-16">
        <div class="container mx-auto text-center px-4">
          <h2 class="text-3xl font-bold text-blue-600 mb-4">About</h2>
          <p class="text-lg text-gray-700 mb-6">
            Virtual Garden is a relaxing, interactive garden simulation game
            where players can design and nurture their own virtual garden.
            Explore different environments, grow plants, and create your
            peaceful oasis.
          </p>
          <p class="text-lg text-gray-700">
            Enjoy the serenity of nature, solve gardening puzzles, and customize
            your garden with a wide variety of plants and accessories. Perfect
            for garden enthusiasts and anyone who loves a relaxing, peaceful
            experience.
          </p>
        </div>
      </section>

      <section class="bg-gray-100 py-16">
        <div class="container mx-auto text-center px-4">
          <h2 class="text-3xl font-bold text-blue-600 mb-8">Features</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div class="feature-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold text-blue-500 mb-4">Grow</h3>
              <Image
                src={honkLogo}
                width={500}
                height={500}
                alt="Picture of the author"
              />
            </div>
            <div class="feature-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold text-blue-500 mb-4">Harvest</h3>
              <Image
                src={honkLogo}
                width={500}
                height={500}
                alt="Picture of the author"
              />
            </div>
            <div class="feature-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold text-blue-500 mb-4">Decorate</h3>
              <Image
                src={honkLogo}
                width={500}
                height={500}
                alt="Picture of the author"
              />
            </div>
          </div>
        </div>
      </section>

      <footer class="bg-gray-900 text-white py-8">
        <div class="container mx-auto text-center px-4">
          <p class="text-sm mb-2">
            © 2024 Virtual Garden. All Rights Reserved.
          </p>
          <div class="flex justify-center space-x-6">
            <a href="/about" class="hover:text-blue-400">
              About
            </a>
            <a href="/privacy" class="hover:text-blue-400">
              Privacy Policy
            </a>
            <a href="/terms" class="hover:text-blue-400">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
