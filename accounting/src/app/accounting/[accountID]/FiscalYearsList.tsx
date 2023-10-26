// 'use client'
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../../db/firebase";

export interface FiscalYear {
    id: string;
    firestoreId: string;
    startDate: string;
    endDate: string;
}

const FiscalYearsList: React.FC = () => {
    const router = useRouter();
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

    const pathname = usePathname();
    const accountId = pathname.split('/').pop();



    const handleViewFiscalYear = (fiscalYear: FiscalYear) => {
        const id = fiscalYear.firestoreId;
        router.push(`/accounting/${accountId}/fiscalYears/${id}`);
    };

    useEffect(() => {
        if (!accountId || typeof accountId !== 'string') {
            return;
        }

        const fiscalYearsQuery = query(
            collection(db, "fiscalYears"),
            where("accountId", "==", accountId)
        );

        const unsubscribe = onSnapshot(fiscalYearsQuery, (querySnapshot) => {
            let itemsArray: FiscalYear[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                itemsArray.push({
                    id: data.id,
                    firestoreId: doc.id,
                    startDate: data.fiscalYearSpan?.start.toDate().toLocaleDateString(),
                    endDate: data.fiscalYearSpan?.end.toDate().toLocaleDateString()
                });
            });
            console.log(querySnapshot);
            console.log(itemsArray);


            setFiscalYears(itemsArray);
        });

        return () => unsubscribe();
    }, [accountId]);

    return (
        <div>
            <h1>List of fiscal years</h1>
            <ul className="fiscal-year-list">
                {fiscalYears.map((fiscalYear: FiscalYear) => (
                    <li key={fiscalYear.id} onClick={() => handleViewFiscalYear(fiscalYear)}>
                        {fiscalYear.startDate} - {fiscalYear.endDate}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FiscalYearsList;
