import { InputSwitch } from 'primereact/inputswitch';
import "primereact/resources/themes/luna-blue/theme.css";   //theme
import "primereact/resources/primereact.min.css";           //core css
import "primeicons/primeicons.css";                         //icons
 
export default function ArtistInfo(props) {
    if (Object.keys(props.params).length === 0) {
        return (
            <p>NULL INFO</p>
        );
    }

    const params = props.params;
    const image = params.images[1];
    const scale = 0.5;
    const h = image.height * scale;
    const w = image.width * scale;
    // TODO: Make func to scale these images to all share one dimension
    return (
        <div>
            <p>{params.name}</p>

            <a href={params.external_urls.spotify} target="_blank" rel="noreferrer">
                <img className="artistImage" src={image.url} alt="Artist Graphic" style={{width: w+"px", height: h+"px"}}/>
            </a>

            <InputSwitch checked={params.existingSelections[params.id]} onChange={(e) => {
                var newValues = {...params.existingSelections}
                newValues[params.id] = e.value;
                params.setSelections(newValues);
            }} />
        </div>
    );
}