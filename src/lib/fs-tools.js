import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON } = fs

const mediasJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../services/medias/medias.json")

/* **********ReadJSON*************** */

export const getMedias = () => readJSON(mediasJSONPath)

/* **********WriteJSON************** */

export const writeMedias = content => writeJSON(mediasJSONPath, content)