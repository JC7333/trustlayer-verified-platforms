import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Platform {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  settings: unknown;
}

interface UserRole {
  platform_id: string;
  role: "platform_owner" | "platform_admin" | "reviewer" | "viewer";
  platform?: Platform;
}

export function usePlatform() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlatforms([]);
      setCurrentPlatform(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    const fetchPlatforms = async () => {
      try {
        // Get user roles with platform info
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("platform_id, role")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        if (roles && roles.length > 0) {
          const platformIds = roles.map((r) => r.platform_id);
          
          const { data: platformsData, error: platformsError } = await supabase
            .from("platforms")
            .select("*")
            .in("id", platformIds);

          if (platformsError) throw platformsError;

          if (platformsData) {
            setPlatforms(platformsData);
            // Set first platform as current
            if (platformsData.length > 0) {
              setCurrentPlatform(platformsData[0]);
              const role = roles.find((r) => r.platform_id === platformsData[0].id);
              if (role) {
                setUserRole({
                  platform_id: role.platform_id,
                  role: role.role as UserRole["role"],
                  platform: platformsData[0],
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, [user]);

  const switchPlatform = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (platform) {
      setCurrentPlatform(platform);
    }
  };

  const hasRole = (requiredRole: UserRole["role"]) => {
    if (!userRole) return false;
    const roleHierarchy = ["viewer", "reviewer", "platform_admin", "platform_owner"];
    const userRoleIndex = roleHierarchy.indexOf(userRole.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    return userRoleIndex >= requiredRoleIndex;
  };

  return {
    platforms,
    currentPlatform,
    userRole,
    loading,
    switchPlatform,
    hasRole,
  };
}
