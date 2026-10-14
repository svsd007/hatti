
import FarmerCard from "../components/FarmerCard";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Business {
    id: string;
    name: string;
    location?: string | null;
    description?: string | null;
}

function Farmers() {
    const [businesses, setBusinesses] = useState<Business[]>([]);

    useEffect(() => {
        async function fetchBusinesses() {
            const { data, error } = await supabase
                .from("Businesses")
                .select("id, name, description");

            if (error) {
                console.error(error);
                return;
            }

            setBusinesses(data ?? []);
        }

        fetchBusinesses();
    }, []);

    return (
        <>
            <section className="page-intro">
                <p className="section-kicker">Farmers</p>
                <h1>Meet the growers behind your basket.</h1>
                <p>
                    A simple directory preview for browsing local farms, learning their
                    specialties, and eventually opening full farmer profiles.
                </p>
            </section>

            <section className="content-section">
                <div className="section-heading">
                    <h2>Local farm directory</h2>
                    <span>{businesses.length} farms near you</span>
                </div>
                <div className="row g-4">
                    {businesses.map((business) => (
                        <div className="col-12 col-lg-6" key={business.id}>
                            <FarmerCard
                                name={business.name}
                                location={business.location ?? "Local farm"}
                                description={business.description ?? "No farm description available yet."}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default Farmers;
