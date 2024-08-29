import * as React from 'react';
import {useTranslation} from "react-i18next";
import {IconButton, Stack} from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";

export default function NumberButtons(props) {
  const { t } = useTranslation();

  return (
    <Stack spacing={0} direction="row" alignItems="center">
      <IconButton onClick={props.onRemove}>
        <RemoveIcon/>
      </IconButton>
      <Box>{props.value}</Box>
      <IconButton onClick={props.onAdd}>
        <AddIcon/>
      </IconButton>
    </Stack>
  )
}
