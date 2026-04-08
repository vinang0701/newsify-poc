function InstitutionAdminHomePage() {
    return (
        <div>
            {/* Right Section */}
            <div className="flex flex-col gap-3 px-4 ">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-muted-foreground">
                    Dashboard
                </div>
                <section>
                    {/* Banner */}
                    <div className="bg-primary flex px-8 py-7 gap-8 rounded-lg">
                        <img
                            src="icon_light.png"
                            height={20}
                            width={102}
                            className="object-contain"
                        />
                        <div className="flex flex-col gap-2 ">
                            <div className="text-button-text text-5xl font-600">
                                Welcome, Institution Admin!
                            </div>
                            <div className="text-button-text">
                                Manage the institution's user accounts and
                                content.
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default InstitutionAdminHomePage;
