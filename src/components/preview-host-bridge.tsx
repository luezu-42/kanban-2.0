import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  collectRoutePathsFromTree,
  installPreviewHostBridge,
} from "@/lib/preview-host-bridge";

export function PreviewHostBridge() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    return installPreviewHostBridge({
      navigate: (path) => {
        routerRef.current.history.push(path);
      },
      getRoutePaths: () => collectRoutePathsFromTree(routerRef.current.routeTree),
    });
  }, []);

  return null;
}
