"use client"

import { Container, Box, TextField, Fab, List, ListItem, ListItemText, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Add, Delete, Edit, Visibility, Done } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import QrCode from 'qrcode';
import Image from 'next/image';

export default function Home() {

  type theLink = {
    url: string,
    editMode: boolean
  }

  const [newLink, setNewLink] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [allLinks, setAllLinks] = useState<theLink[]>([]);
  const [buttonsDisplay, setButtonsDisplay] = useState(true);
  const [editedLink, setEditedLink] = useState("");
  const [inputError, setInputError] = useState(false);
  const [helperText, setHelperText] = useState("");

  async function generateQRCode(URL: string) {
    const src = await QrCode.toDataURL(URL);
    setImgSrc(src);
  }

  function validation(value: string) {
    const objIndex = allLinks.findIndex(link => link.url == value.trim());
    if (!value.trim()) {
      setInputError(true);
      setHelperText("links can't be empty");
      return true
    }
    else if (objIndex != -1) {
      setInputError(true);
      setHelperText("this link was existed before");
      return true
    }
    else {
      setInputError(false);
      setHelperText("");
      return false
    }
  }

  function addNewLink() {
    const validate = validation(newLink);
    if (!validate) {
      const linksArray = localStorage.getItem("links");
      const links = linksArray && JSON.parse(linksArray);
      const newLinks = [...links, { url: newLink.trim(), editMode: false }];
      localStorage.setItem("links", JSON.stringify(newLinks));
      generateQRCode(newLink);
      setNewLink("");
      setAllLinks(newLinks);
      setButtonsDisplay(true);
    }
  }

  function deleteLink(text: string) {
    const linksArray = localStorage.getItem("links");
    const links = linksArray && JSON.parse(linksArray);
    const newLinks = links.filter((link: theLink) => link.url != text);
    localStorage.setItem("links", JSON.stringify(newLinks));
    setAllLinks(newLinks);
    setButtonsDisplay(true);
    setImgSrc("");
  }

  function editMode(text: string) {
    const objIndex = allLinks.findIndex(link => link.url == text);
    const tepm = [...allLinks];
    tepm[objIndex].editMode = true;
    setAllLinks(tepm);
    setButtonsDisplay(false);
    setEditedLink(text);
  }

  function editLink(text: string) {
    const objIndex = allLinks.findIndex(link => link.url == text.trim());
    const newObjIndex = allLinks.findIndex(link => link.url == editedLink.trim());
    const tepm = [...allLinks];
    if (editedLink.trim() && newObjIndex == -1) {
      tepm[objIndex].url = editedLink.trim();
      generateQRCode(editedLink)
    }
    tepm[objIndex].editMode = false;
    localStorage.setItem("links", JSON.stringify(tepm));
    setAllLinks(tepm);
    setButtonsDisplay(true);
  }

  useEffect(() => {
    const links = localStorage.getItem("links");
    if (!links) {
      localStorage.setItem("links", "[]");
    }
    else {
      setAllLinks(JSON.parse(links));
    }
  }, [])

  return (
    <>
      <Container maxWidth="lg">
        <Grid container spacing={2} sx={{ border: "solid", padding: 4, margin: 2 }}>
          <Grid size={11}>
            <TextField error={inputError} helperText={helperText} value={newLink} onInput={(e: React.ChangeEvent<HTMLInputElement>) => setNewLink(e.target.value)} fullWidth id="outlined" label="Add new link" variant="outlined" />
          </Grid>
          <Grid size={1}>
            <Fab onClick={addNewLink} color="success" aria-label="add">
              <Add />
            </Fab>
          </Grid>
          <Grid size={8}>
            <List sx={{ height: 250, border: "solid 1px #c4c4c4", borderRadius: 1, marginTop: 3, overflow: "auto", direction: "rtl" }}>
              {
                allLinks.map((link: theLink, index: number) => (

                  <Box key={index} sx={{ position: "relative" }}>
                    {
                      link.editMode ?
                        <Box>
                          <TextField onInput={(e: React.ChangeEvent<HTMLInputElement>) => setEditedLink(e.target.value)} defaultValue={link.url} id="outlined" variant="outlined" sx={{ direction: "ltr", paddingRight: 17, width: "79%" }} />
                          <Box sx={{ position: "absolute", right: 16, top: 10, zIndex: 1 }}>
                            <IconButton onClick={() => generateQRCode(link.url)}>
                              <Visibility />
                            </IconButton>
                            <IconButton onClick={() => deleteLink(link.url)}>
                              <Delete />
                            </IconButton>
                            <IconButton onClick={() => editLink(link.url)}>
                              <Done />
                            </IconButton>
                          </Box>
                        </Box>
                        :
                        <ListItem sx={{ paddingRight: 17, overflow: "hidden" }}
                          secondaryAction={
                            <Box sx={{ display: buttonsDisplay ? "block" : "none" }}>
                              <IconButton onClick={() => generateQRCode(link.url)}>
                                <Visibility />
                              </IconButton>
                              <IconButton onClick={() => deleteLink(link.url)}>
                                <Delete />
                              </IconButton>
                              <IconButton onClick={() => editMode(link.url)}>
                                <Edit />
                              </IconButton>
                            </Box>
                          }>
                          <ListItemText
                            primary={link.url}
                          />
                        </ListItem>
                    }
                  </Box>
                ))
              }
            </List>
          </Grid>
          <Grid size={4}>
            {
              imgSrc && <Image src={imgSrc} alt='QRCode' width={300} height={300} style={{ display: "inline-block" }} />
            }
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
