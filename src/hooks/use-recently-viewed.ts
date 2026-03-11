// import { useState, useEffect } from "react";

// export const useRecentlyViewed = () => {
//   const [recent, setRecent] = useState<string[]>([]);

//   useEffect(() => {
//     // Read from storage on mount
//     const saved = localStorage.getItem("recently_viewed");
//     if (saved) {
//       setRecent(JSON.parse(saved));
//     }
//   }, []);

//   return recent;
// };
