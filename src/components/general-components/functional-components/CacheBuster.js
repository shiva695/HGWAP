import { useEffect, useState } from "react";
import packageJson from "../../../../package.json";
global.appVersion = packageJson.version;

// first param: meta.json version, second param: package.json version
const semverGreaterThan = (versionA, versionB) => {
  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

const CacheBuster = (props) => {
  const [loading, setLoading] = useState(true);
  const [isLatestVersion, setIsLatestVersion] = useState(true);
  const refreshCacheAndReload = () => {
    // delete browser cache and hard reload
    window.location.reload(true);
  };

  useEffect(() => {
    const checkVersion = async () => {
      fetch(`/meta.json?r=${Math.random()}`, { cache: "no-cache" })
        .then((response) => response.json())
        .then((meta) => {
          const latestVersion = meta.version;
          const currentVersion = global.appVersion;

          const shouldForceRefresh = semverGreaterThan(
            latestVersion,
            currentVersion
          );
          if (shouldForceRefresh) {
            console.log(`We have a new version - ${latestVersion}. Should force refresh`);
            setLoading(false);
            setIsLatestVersion(false);
          } else {
            // console.log(`You already have the latest version - ${latestVersion}. No cache refresh needed.`);
            setLoading(false);
            setIsLatestVersion(true);
          }
        });
    };
    checkVersion();
  });

  return props.children({ loading, isLatestVersion, refreshCacheAndReload });
};

export default CacheBuster;
