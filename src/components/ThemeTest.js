import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  // FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

const ThemeTest = () => {
  return (
    <>
      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Primary Button
      </Typography>
      <Button
        variant="contained"
        sx={{
          width: "300px",
          mx: 4,
          mb: 3,
        }}
      >
        Submit
      </Button>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Disabled Primary Button
      </Typography>
      <Button
        variant="contained"
        disabled
        sx={{
          width: "300px",
          mx: 4,
          mb: 3,
        }}
      >
        Submit
      </Button>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Disabled Primary Button with loader
      </Typography>
      <Button
        variant="contained"
        disabled
        sx={{
          width: "300px",
          mx: 4,
          mb: 3,
        }}
      >
        Submit <CircularProgress size={24} sx={{ ml: 2, color: "#AAACAE" }} />
      </Button>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Secondary Button
      </Typography>
      <Button
        variant="outlined"
        sx={{
          width: "300px",
          mx: 4,
          mb: 3,
        }}
      >
        Submit
      </Button>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Disabled Secondary Button
      </Typography>
      <Button
        variant="outlined"
        disabled
        sx={{
          width: "300px",
          mx: 4,
          mb: 3,
        }}
      >
        Submit
      </Button>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Disabled Secondary Button with loader
      </Typography>
      <Button
        variant="outlined"
        disabled
        sx={{
          width: "300px",
          mx: 4,
          mb: 3,
        }}
      >
        Submit <CircularProgress size={24} sx={{ ml: 2, color: "#AAACAE" }} />
      </Button>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Checkboxes
      </Typography>
      <FormGroup
        sx={{
          mx: 4,
          mb: 3,
        }}
      >
        <FormControlLabel control={<Checkbox />} label="Mild" />
        <FormControlLabel control={<Checkbox />} label="Medium" />
        <FormControlLabel control={<Checkbox />} label="Hot" />
      </FormGroup>

      <Typography
        sx={{
          mx: 4,
          my: 1,
        }}
      >
        Radio Buttons
      </Typography>
      <FormControl
        sx={{
          mx: 4,
          mb: 3,
        }}
      >
        {/* <FormLabel id="demo-radio-buttons-group-label">Veg / Non-Veg</FormLabel> */}
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
        >
          <FormControlLabel value="veg" control={<Radio />} label="Veg" />
          <FormControlLabel
            value="nonVeg"
            control={<Radio />}
            label="Non-Veg"
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

export default ThemeTest;
