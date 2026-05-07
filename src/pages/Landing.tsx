import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">BNKhub</h1>
          <p className="text-xl text-muted-foreground mb-8">مرحبا بك في منصة البث</p>
          <Link to="/home">
            <Button size="lg">أبدأ الآن</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
