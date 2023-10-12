'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
            router.push("/");
        }
    }, []);

    const handleLogout = () => {
        // Remove the logged-in user from the context
        localStorage.removeItem("user");
        // Redirect to the login page
        router.push("/");
    };

    return (
        <div>
            <h1>Homepage</h1>
            <h2>Welcome, {user}!</h2>
            <ul>
                <li>
                    <Link className="create-fiscal-year-book" href="/fiscal-year-book/new">Create a new fiscal year book</Link>
                </li>
                <li>
                    <Link className="see-earlier-fiscal-years" href="/fiscal-year-book/list">See the earlier fiscal years</Link>
                </li>
                <li>
                    <Link className="see-accounts" href="/accounts">See a list of accounts</Link>
                </li>
            </ul>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
};

export default HomePage;
