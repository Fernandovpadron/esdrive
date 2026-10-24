#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$#" -ne 2 ]]; then
    echo 'Uso: ./git-push.sh <archivo> <mensaje-del-commit>'
    exit 1
fi

archivo="$1"
comentario="$2"

if [[ ! -f "$archivo" ]]; then
    echo "ERROR: No existe el archivo: $archivo"
    exit 1
fi

echo
echo "Archivo: $archivo"
echo "Commit:  $comentario"
echo

# Preparar únicamente el archivo indicado
git add -- "$archivo"

# Comprobar si hay cambios preparados
if git diff --cached --quiet; then
    echo "No hay cambios preparados para confirmar."
    echo "No se creó ningún commit."
    exit 0
fi

# Crear el commit
git commit -m "$comentario"

# Publicar la rama
git push origin esdrive

echo
echo "Cambios publicados correctamente."

