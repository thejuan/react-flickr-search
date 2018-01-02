import {Label, Modal, Image} from 'semantic-ui-react';
import { ISearchProps } from './SearchStore';
import * as React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';

@observer
export class ImageDetailView extends React.Component<ISearchProps, any>{

    render() {
        var img = this.props.searchStore.selectedImage;
        if (!img){
            return null;
        }
        var tags = img.tags.map(tag => <Label key={tag} tag={true} content={tag} />);

        return (<Modal open={img != null} onClose={this.close.bind(this)} closeOnEscape={true} closeOnRootNodeClick={true}>
            <Modal.Header>{img.title}</Modal.Header>
            <Modal.Content image>
              <Image wrapped size='massive' src={img.thumbnailUrl} />
              <Modal.Description>
                <div className="content">
                {tags}
                
                    <div className="ui sub header">{img.author}</div>
                    <i>{img.date.format("DD/MM/YYYY")}</i>
                    <p><a href={img.originalUrl}>Visit original</a></p>
                </div>
              </Modal.Description>
            </Modal.Content>
          </Modal>);
        
     }

    @action
    close(){
      this.props.searchStore.selectedImage = null;
    }

}