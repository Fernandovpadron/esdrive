#!/usr/bin/env bash
set -e

if [ "$#" -ne 2 ]; then
    echo "Uso: ./git-push.sh <archivo> <mensaje-del-commit>"
    exit 1
fi

archivo="$1"
comentario="$2"

if [ ! -f "$archivo" ]; then
    echo "ERROR: No existe el archivo: $archivo"
    exit 1
fi

git add -- "$archivo"
git commit -m "$comentario"
git push origin esdrive
