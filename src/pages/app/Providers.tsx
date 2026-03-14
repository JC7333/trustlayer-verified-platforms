import { AppLayout } from "@/components/layout/AppLayout";

const Providers = () => {
  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Prestataires</h1>
        <p className="text-muted-foreground">
          Gérez vos prestataires et leurs documents de conformité.
        </p>
      </div>
    </AppLayout>
  );
};

export default Providers;
