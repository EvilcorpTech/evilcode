TaskMarker="*"
DoneMarker="✓"

ResetStyle=
BoldStyle=
ReverseStyle=
GreenStyle=
YellowStyle=
RedStyle=
BlueStyle=
GrayStyle=
if test -t 1 -a ! -p /dev/stdout; then
        # We are not redirected in a pipe.
        ResetStyle="$(tput sgr0)"
        BoldStyle="$(tput bold)"
        ReverseStyle="$(tput rev)"
        if test $(tput colors) -le 8; then
                GreenStyle="$(tput setaf 2)"
                YellowStyle="$(tput setaf 3)"
                RedStyle="$(tput setaf 1)"
                BlueStyle="$(tput setaf 4)"
                GrayStyle="$(tput setaf 8)"
        else
                GreenStyle="$(tput setaf 120)"
                YellowStyle="$(tput setaf 229)"
                RedStyle="$(tput setaf 160)"
                BlueStyle="$(tput setaf 75)"
                GrayStyle="$(tput setaf 239)"
        fi
fi
ErrorStyle="$RedStyle"
WarningStyle="$YellowStyle"
SuccessStyle="$GreenStyle"
DimmedStyle="$GrayStyle"