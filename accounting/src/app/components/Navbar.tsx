import Link from "next/link";

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li>
                    <Link href="/accounts">Accounts</Link>
                    <ul>
                        <li>
                            <Link href="/accounts/new">Create new account</Link>
                        </li>
                        <li>
                            <Link href="/accounts/list">See earlier accounts</Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <Link href="/logout">Log out</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
