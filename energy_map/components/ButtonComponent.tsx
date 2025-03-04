import { useEffect } from "react";

interface ButtonComponentProps {
    buildingHeight: number | null;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ buildingHeight }) => {
    useEffect(() => {
        const handleClick = async () => {
            if (buildingHeight === null) {
                alert("Please click on a building first!");
                return;
            }

            try {
                alert(`Sending API request with Building Height: ${buildingHeight}m...`);

                const response = await fetch("http://localhost:5000/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Building_Type: 1,
                        Building_Shape: 1,
                        Orientation: 1,
                        Building_Height: buildingHeight, // pass clicked building height
                        Building_Stories: 1,
                        Wall_Area: 1,
                        Window_Area: 1,
                        Roof_Area: 1,
                        energy_code: 1,
                        hvac_category: 1,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to get prediction from Flask API");
                }

                const result = await response.json();
                const coolingLoad = result.cooling_load_prediction?.[0] ?? "N/A";
                const heatingLoad = result.heating_load_prediction?.[0] ?? "N/A";

                alert(
                    `Energy Load Predictions:\n\n` +
                    `Cooling Load: ${coolingLoad.toFixed(2)} kWh\n` +
                    `Heating Load: ${heatingLoad.toFixed(2)} kWh`
                );

            } catch (error: any) {
                alert(`Error during API call:\n${error.message}`);
            }
        };

        const button = document.getElementById("hello-button");
        if (button) {
            button.addEventListener("click", handleClick);
        }

        return () => {
            if (button) {
                button.removeEventListener("click", handleClick);
            }
        };
    }, [buildingHeight]);

    return null;
};

export default ButtonComponent;
