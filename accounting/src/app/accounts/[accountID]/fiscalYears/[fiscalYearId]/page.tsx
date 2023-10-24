'use client'
import { usePathname } from "next/navigation";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../../db/firebase";
import { useState, useEffect } from "react";

interface FiscalYear {
    id: string;
    name: string;
    startDate: string,
    endDate: string
}

const FiscalYearPage: React.FC = () => {
    const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);

    const pathname = usePathname();
    const fiscalYearId: any = pathname.split('/').pop();  // Updated this line
    
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
        </div>
    );
};

export default FiscalYearPage;
