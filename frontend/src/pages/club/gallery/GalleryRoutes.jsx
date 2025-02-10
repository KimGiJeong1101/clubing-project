import { Routes, Route } from "react-router-dom";
import Gallery from "./Gallery";


function GalleryRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Gallery />} />
    </Routes>
  );
}

export default GalleryRoutes;
