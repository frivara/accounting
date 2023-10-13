'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

const HomePage: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        // Get the logged-in user from the context
        const user = localStorage.getItem("user");
        if (user) {
            setUser(user);
        } else {
            // Redirect to the login page if the user is not logged in
            router.push("/login");
        }
    }, []);

    const handleLogout = () => {
        // Remove the logged-in user from the context
        localStorage.removeItem("user");
        // Redirect to the login page
        router.push("/login");
    };

    return (
        <div>
            <Navbar />
            <h1>Homepage</h1>
            <h2>Welcome, {user}!</h2>
            <ul>
                <li>
                    <Link className="view-fiscal-year" href="/fiscal-year-book">
                        Handle fiscal years
                    </Link>
                </li>
                <li>
                    <Link className="see-accounts" href="/accounts">
                        See a list of accounts
                    </Link>
                </li>
            </ul>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
};

export default HomePage;
