'use client'
import { usePathname } from "next/navigation";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../../db/firebase";
import { useState, useEffect } from "react";
import Link from 'next/link';  // Import Link

interface FiscalYear {
    id: string;
    name: string;
    startDate: string,
    endDate: string
}

const FiscalYearPage: React.FC = () => {
    const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);

    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const fiscalYearId: string = pathSegments[pathSegments.length - 1]; 
    const accountId: string = pathSegments[pathSegments.length - 3];
    
    // Fetch the fiscal year data from the database
    useEffect(() => {
    
        if (!fiscalYearId || typeof fiscalYearId !== 'string') {
            return;
        }
    
        const fiscalYearRef = doc(db, "fiscalYears", fiscalYearId);
    
        const unsubscribe = onSnapshot(fiscalYearRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
        
                const fiscalYearData = {
                    id: doc.id,
                    name: data?.name || '',
                    startDate: data?.fiscalYearSpan?.start?.toDate().toLocaleDateString() || '',
                    endDate: data?.fiscalYearSpan?.end?.toDate().toLocaleDateString() || ''
                };
        
                setFiscalYear(fiscalYearData);
            }
        });

        
    
        return () => {
            unsubscribe();
        };
    }, [fiscalYearId]);

    if (!fiscalYear) {
        return <div>Fiscal year not found</div>;
    }

    return (
        <div>
            <h1>Fiscal Year</h1>
            <p>Name: {fiscalYear.name}</p>
            <p>Start date: {fiscalYear.startDate}</p>
            <p>End date: {fiscalYear.endDate}</p>
            <Link href={`/accounts/${accountId}/fiscalYears/${fiscalYearId}/transactions/new`}>
                <button>Create New Transaction</button>
            </Link>
        </div>
    );
};

export default FiscalYearPage;
