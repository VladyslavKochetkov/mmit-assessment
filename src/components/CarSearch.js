import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

const isOutsideOfRange = (number, min, max) => {
  if (!number) return true;
  return number < min || number > max;
};

const makeSearchUrl = (type, makes, year) =>
  makes.map(
    (make) =>
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${
        make.MakeId
      }${
        year ? `/modelyear/${year}` : ""
      }/vehicleType/${type.Name.trim()}?format=json`
  );

const CarSearch = ({ setResults }) => {
  const [vehicleTypes, setVehicleTypes] = useState(null);
  const [vehicleMakes, setVehicleMakes] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [useYear, setUseYear] = useState(false);
  const [year, setYear] = useState("");
  const [lastSearchUrl, setLastSearchUrl] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const getVehicles = async () => {
      const res = await fetch(
        "https://vpic.nhtsa.dot.gov/api/vehicles/getvehiclevariablevalueslist/vehicle%20type?format=json"
      );
      const data = await res.json();

      setVehicleTypes(data.Results);
    };

    getVehicles();
  }, []);

  useEffect(() => {
    const getVehicleMakes = async () => {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${selectedVehicle.Name.trim()}?format=json`
      );

      const data = await res.json();

      setVehicleMakes(
        data.Results.sort((a, b) => a.MakeName.localeCompare(b.MakeName))
      );
    };
    setVehicleMakes(null);
    if (selectedVehicle) {
      getVehicleMakes();
    }
  }, [selectedVehicle]);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    const urls = makeSearchUrl(
      selectedVehicle,
      selectedMakes,
      useYear ? year : undefined
    );
    setLastSearchUrl(urls.join());

    const allCarsRequests = await Promise.all(urls.map((url) => fetch(url)));
    const allCarsJSON = await Promise.all(
      allCarsRequests.map((req) => req.json())
    );
    const allCars = allCarsJSON.map((cars) => cars.Results).flat();
    setResults(allCars);
    setSearching(false);
  }, [selectedVehicle, selectedMakes, useYear, year, setResults]);

  return (
    <div>
      <Typography variant="h5" component={"h2"}>
        Car Search
      </Typography>
      <FormControl fullWidth className="my-2">
        <InputLabel id="vehicle-type-label" size="small">
          Vehicle Type
        </InputLabel>
        <Select
          labelId="vehicle-type-label"
          id="vehicle-type"
          size="small"
          value={selectedVehicle ? selectedVehicle.Name : ""}
          onChange={({ target: { value } }) =>
            setSelectedVehicle(
              vehicleTypes.find((vehicle) => vehicle.Name === value)
            )
          }
        >
          {vehicleTypes?.map((type) => (
            <MenuItem value={type.Name} key={type.Name}>
              {type.Name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth className="my-2">
        <InputLabel id="vehicle-make-label" size="small">
          Vehicle Make
        </InputLabel>
        <Select
          labelId="vehicle-make-label"
          id="vehicle-make"
          size="small"
          multiple
          value={selectedMakes.map((make) => make.MakeName)}
          onChange={({ target: { value } }) => {
            const makes = typeof value === "string" ? value.split(",") : value;
            setSelectedMakes(
              makes.map((item) =>
                vehicleMakes.find((make) => make.MakeName === item)
              )
            );
          }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {vehicleMakes?.map((make) => (
            <MenuItem value={make.MakeName} key={make.MakeName}>
              {make.MakeName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Use Year?</FormLabel>
        <div className="flex">
          <Checkbox
            checked={useYear}
            onChange={({ target: { checked } }) => {
              setUseYear(checked);
            }}
          />
          {useYear && (
            <TextField
              error={
                !!(
                  year &&
                  isOutsideOfRange(
                    parseInt(year),
                    1886,
                    new Date().getFullYear()
                  )
                )
              }
              helperText={
                year &&
                isOutsideOfRange(
                  parseInt(year),
                  1886,
                  new Date().getFullYear()
                ) &&
                "Please enter valid year"
              }
              id="year"
              label="Year"
              variant="outlined"
              className={clsx(!useYear && "invisible")}
              size="small"
              value={year}
              onChange={({ target: { value } }) => setYear(value)}
            />
          )}
        </div>
      </FormControl>
      <FormControl className="mt-2 flex items-center">
        <Button
          fullWidth
          variant="contained"
          disabled={
            searching ||
            selectedMakes.length === 0 ||
            (useYear &&
              isOutsideOfRange(
                parseInt(year),
                1886,
                new Date().getFullYear()
              )) ||
            lastSearchUrl ===
              makeSearchUrl(
                selectedVehicle,
                selectedMakes,
                useYear ? year : undefined
              ).join()
          }
          onClick={handleSearch}
        >
          Search
        </Button>
        {searching && <CircularProgress size={24} className="mt-4" />}
      </FormControl>
    </div>
  );
};

export default CarSearch;
