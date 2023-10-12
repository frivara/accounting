'use client'
import Link from "next/link";

const NewFiscalYear: React.FC = () => {
    return (
        <div>
            <h1>Fiscal year</h1>
            <ul>
                <li>
                    <Link href="/">Home page</Link>
                </li>
                <li>
                    <Link href="/fiscal-year-book/new">Create a new fiscal year book</Link>

                </li>
                <li>
                    <Link href="/fiscal-year-book/list">See the earlier fiscal years</Link>

                </li>
            </ul>

        </div>
    );
};

export default NewFiscalYear;

