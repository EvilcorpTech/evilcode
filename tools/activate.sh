__activate_sh() {
        local project_dir="$PWD"

        if test -n "${BASH_SOURCE-}"; then
                project_dir="$(cd "$(dirname "$BASH_SOURCE")/.." && pwd)"
        elif test -n "${DASH_SOURCE-}"; then
                project_dir="$(cd "$(dirname "$DASH_SOURCE")/.." && pwd)"
        elif test -n "${ZSH_VERSION-}"; then
                project_dir="$(cd "$(dirname "${(%):-%x}")/.." && pwd)"
        fi

        local project_name="${ProjectName:-$(basename "$project_dir")}"

        if printf -- '%s' "${PS1:-}" | grep -q "($project_name)"; then
                return
        fi

        PS1="($project_name) ${PS1:-}"

        export PATH="$project_dir/tools${PATH:+:$PATH}"
}

__activate_sh

unset -f __activate_sh
