set -e # errexit
set -u # nounset

: ${OIFS:=$IFS}

path_add() {
        IFS=':'
        for dir in $PATH; do
                IFS="$OIFS"
                if test "$dir" = "$1"; then
                        return
                fi
        done
        IFS="$OIFS"

        export PATH="$1${PATH:+:$PATH}"
}

path_add "$ProjectDir/tools"

if test -e "$ProjectDir/env.sh"; then
        . "$ProjectDir/env.sh"
fi

export ENV
export NODE_ENV

: ${ENV:=dev}
if test "$ENV" = 'pro'; then
        : ${NODE_ENV:=production}
else
        : ${NODE_ENV:=development}
fi