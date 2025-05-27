import {useTranslation} from "react-i18next";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import React from "react";
import {FormControl, InputLabel} from "@mui/material";

export default function WYSIWYG(props) {
  const { t } = useTranslation();

  return (<>
    <FormControl size="small" fullWidth className={props.className}>
      <InputLabel id={`label_${props.name}`} shrink>{props.label}</InputLabel>
      <CKEditor labelId={`label_${props.name}`}
        editor={ClassicEditor}
        data={props.value}
        onChange={(event, editor) => props.onChange({target: {name: props.name, value: editor.getData()}})}
      />
    </FormControl>
  </>)
}
