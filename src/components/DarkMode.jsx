import React, { useState } from "react";
import { ThemeProvider } from "@material-ui/core";
import { createTheme, makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Brightness3Icon from "@material-ui/icons/Brightness3";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Time from "./Time";
import Navigation from "./Navigation";
import WalletInfoDashboard from "./WalletInfoDashboard";

function DarkMode() {
  const useStyles = makeStyles((theme) => ({
              root: {
                marginBottom: theme.spacing(2),
                flexGrow: 1,
              },
              title: {
                flexGrow: 1,
              },
      }));

  const light = {palette: {type: "light"}};
  const dark = {palette: {type: "dark"}};


  const [theme, setTheme] = useState(true);
  const classes = useStyles();
  const icon = !theme ? <Brightness7Icon /> : <Brightness3Icon />;
  const appliedTheme = createTheme(theme ? light : dark);
  return (
    <ThemeProvider theme={appliedTheme}>
      <Paper>
        <div align="right" className={classes.root}>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="mode"
            onClick={() => setTheme(!theme)}
          >
            {icon}
          </IconButton>
        </div>
        <h2 align="center">ERC20 BOT</h2>
        <Time />
        <WalletInfoDashboard />
        <Navigation />
      </Paper>
    </ThemeProvider>
  );
}

 
export default DarkMode;
