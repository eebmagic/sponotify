import { Button } from 'primereact/button';
import "primereact/resources/themes/luna-blue/theme.css";   //theme
import "primereact/resources/primereact.min.css";           //core css
import "primeicons/primeicons.css";                         //icons
import { addSubscriptions } from "./mongoFuncs";
import { getUserInfo } from "./spotifyFuncs"

export default function ArtistList(props) {
    const artists = props.artists;
    if (props.artists.length === 0) {
        return (
            <p>NULL INFO</p>
        );
    }

    const flipAll = (target) => {
        const old = artists[0].props.params.existingSelections;
        const setter = artists[0].props.params.setSelections;

        var newValues = {...old};
        Object.keys(newValues).forEach(key => {
            newValues[key] = target;
        })
        setter(newValues);
    }

    const doneFunc = () => {
        console.log('CLICKED DONE!!!');
        const selections = artists[0].props.params.existingSelections;

        getUserInfo(props.token).then(userInfo => {
            const email = userInfo.data.email;
            addSubscriptions(email, selections);
        })

        return selections;
    }

    // TODO: Change func for DONE button to move to next page of site
    // TODO: Change layout for artists to be a grid
    return (
        <div>
            <Button label="Done" icon="pi pi-check" onClick={() => doneFunc()}/>
            <Button label="Select All" className="p-button-outlined p-button-success" onClick={() => flipAll(true)} />
            <Button label="Deselect All" className="p-button-outlined p-button-danger" onClick={() => flipAll(false)} />
            <div>
                {artists}
            </div>
        </div>
    );
}