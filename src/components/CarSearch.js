import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import WithLoader from "./WithLoader";

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
  const { enqueueSnackbar } = useSnackbar();
  const [vehicleTypes, setVehicleTypes] = useState(null);
  const [vehicleMakes, setVehicleMakes] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [useYear, setUseYear] = useState(false);
  const [year, setYear] = useState("");
  const [yearValidationError, setYearValidationError] = useState(null);
  const [lastSearchUrl, setLastSearchUrl] = useState(null);
  const [searching, setSearching] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);

  const ref = useRef({ requestCount: 0 });

  useEffect(() => {
    if (ref.current.requestCount !== 0) return;
    ref.current.requestCount++;
    let resetTimeout;
    const getVehicles = async () => {
      let retryCount = 0;
      try {
        const res = await fetch(
          "https://vpic.nhtsa.dot.gov/api/vehicles/getvehiclevariablevalueslist/vehicle%20type?format=json"
        );
        if (res.status !== 200) {
          throw new Error(`Response status was: ${res.status}: Expected 200`);
        }
        const data = await res.json();

        setVehicleTypes(data.Results);
      } catch (e) {
        console.error(e);
        retryCount++;
        enqueueSnackbar(
          `Failed to get vehicle types - Retrying in ${retryCount * 5} seconds`
        );
        resetTimeout = setTimeout(getVehicles, retryCount * 5000);
      }
    };

    getVehicles();

    return () => clearTimeout(resetTimeout);
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!selectedVehicle) return;
    let resetTimeout;
    const getVehicleMakes = async () => {
      let retryCount = 0;
      try {
        const res = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${selectedVehicle.Name.trim()}?format=json`
        );

        const data = await res.json();

        setVehicleMakes(
          data.Results.sort((a, b) => a.MakeName.localeCompare(b.MakeName))
        );
      } catch (e) {
        console.error(e);
        retryCount++;
        enqueueSnackbar(
          `Failed to get vehicle makes - Retrying in ${retryCount * 5} seconds`
        );
        resetTimeout = setTimeout(getVehicleMakes, retryCount * 5000);
      }
    };
    setVehicleMakes(null);
    if (selectedVehicle) {
      getVehicleMakes();
    }

    return () => clearTimeout(resetTimeout);
  }, [selectedVehicle, enqueueSnackbar]);

  useEffect(() => {
    if (!selectedVehicle || selectedMakes.length === 0) {
      setCurrentUrl(null);
      return;
    }
    setCurrentUrl(
      makeSearchUrl(
        selectedVehicle,
        selectedMakes,
        useYear ? year : undefined
      ).join()
    );
  }, [selectedVehicle, selectedMakes, useYear, year]);

  const handleSearch = useCallback(
    async (retryCount = 0) => {
      try {
        setSearching(true);
        setResults(null);
        const urls = makeSearchUrl(
          selectedVehicle,
          selectedMakes,
          useYear ? year : undefined
        );
        setLastSearchUrl(urls.join());

        const allCarsRequests = await Promise.all(
          urls.map((url) => fetch(url))
        );
        const allCarsJSON = await Promise.all(
          allCarsRequests.map((req) => req.json())
        );
        const allCars = allCarsJSON.map((cars) => cars.Results).flat();
        setResults(allCars);
        setSearching(false);
      } catch (e) {
        console.error(e);
        enqueueSnackbar(
          `Failed to get vehicle makes - Retrying in ${retryCount * 5} seconds`
        );
        setTimeout(() => handleSearch(retryCount + 1), retryCount * 5000);
      }
    },
    [selectedVehicle, selectedMakes, useYear, year, setResults, enqueueSnackbar]
  );

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
      <WithLoader shown={selectedVehicle && !vehicleMakes}>
        <FormControl fullWidth className="my-2 relative">
          <InputLabel id="vehicle-make-label" size="small">
            Vehicle Make
          </InputLabel>
          <Select
            disabled={!selectedVehicle}
            helperText={!selectedVehicle && "Select Vehicle"}
            labelId="vehicle-make-label"
            id="vehicle-make"
            size="small"
            multiple
            value={selectedMakes.map((make) => make.MakeName)}
            onChange={({ target: { value } }) => {
              const makes =
                typeof value === "string" ? value.split(",") : value;
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
          <FormHelperText hidden={selectedVehicle}>
            Select Vehicle First
          </FormHelperText>
        </FormControl>
      </WithLoader>
      <FormControl fullWidth>
        <FormLabel>Use Year?</FormLabel>
        <div className="flex">
          <Checkbox
            checked={useYear}
            onChange={({ target: { checked } }) => {
              setUseYear(checked);
              setYearValidationError(null);
            }}
          />
          {useYear && (
            <TextField
              error={!!yearValidationError}
              helperText={yearValidationError}
              id="year"
              label="Year"
              variant="outlined"
              className={clsx(!useYear && "invisible")}
              size="small"
              value={year}
              onChange={({ target: { value } }) => {
                setYear(value);
                setYearValidationError(
                  isOutsideOfRange(
                    parseInt(year),
                    1886,
                    new Date().getFullYear()
                  )
                    ? null
                    : "Please enter valid year"
                );
              }}
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
            yearValidationError ||
            lastSearchUrl === currentUrl
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
