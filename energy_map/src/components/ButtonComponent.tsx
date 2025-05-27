import { useEffect } from "react";
import { predict, predictAll } from "../../api/route"; // adjust the path as needed

interface ButtonComponentProps {
  buildingHeight: number | null;
  selectedFeature: any | null; // full GeoJSON feature
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  selectedFeature,
}) => {
  useEffect(() => {
    const handleClick = async () => {
      if (selectedFeature === null) {
        alert("Please click on a building first!");
        return;
      }

      try {
        const result = await predict(selectedFeature);
        const coolingLoad = result.cooling_load_prediction?.[0] ?? "N/A";
        const heatingLoad = result.heating_load_prediction?.[0] ?? "N/A";

        alert(
          `Energy Load Predictions:\n\n` +
            `Cooling Load: ${
              typeof coolingLoad === "number"
                ? coolingLoad.toFixed(2)
                : coolingLoad
            } kWh\n` +
            `Heating Load: ${
              typeof heatingLoad === "number"
                ? heatingLoad.toFixed(2)
                : heatingLoad
            } kWh`
        );
      } catch (error: any) {
        alert(`Error during API call:\n${error.message}`);
      }
    };

    const handleRefreshClick = async () => {
      try {
        const { geojsonData, results } = await predictAll();
        console.log("API Results:", results);

        // Get the map instance from maplibregl
        const map = window.mapInstance;
        if (map && map.getSource("custom-buildings")) {
          (map.getSource("custom-buildings") as any).setData(geojsonData);

          const event = new CustomEvent("predictionsUpdated", {
            detail: { geojsonData },
          });
          document.dispatchEvent(event);

          alert(
            `Successfully refreshed predictions for ${results.length} buildings. Data updated on map.`
          );
        } else {
          console.error("Map or custom-buildings source not found");
          alert("Could not update map data. Try reloading the page.");
        }
      } catch (error: any) {
        console.error("Error in handleRefreshClick:", error);
        alert(`Error refreshing predictions:\n${error.message}`);
      }
    };

    const button = document.getElementById("hello-button");
    if (button) {
      button.addEventListener("click", handleClick);
    }
    const refreshButton = document.getElementById("refresh-button");
    if (refreshButton) {
      refreshButton.addEventListener("click", handleRefreshClick);
    }

    return () => {
      if (button) {
        button.removeEventListener("click", handleClick);
      }
      if (refreshButton) {
        refreshButton.removeEventListener("click", handleRefreshClick);
      }
    };
  }, [selectedFeature]);

  return null;
};

export default ButtonComponent;
