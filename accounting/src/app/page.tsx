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
            router.push("/login");
        }
    }, []);



    return (
        <div className="homepage">
            <h1>Homepage</h1>
            <h2>Welcome, {user}!</h2>
            <ul>
                <li>
                    <Link className="see-accounts" href="/accounts">
                        Accounts
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default HomePage;
