import { ImageDetailView } from './ImageDetailView';
import { IImageProps, ISearchProps } from './SearchStore';

import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { Image } from 'semantic-ui-react'
import StackGrid from 'react-stack-grid'


@observer
export class SearchResultsView extends React.Component<ISearchProps, any>{

    render() {
        var cards = this.props.searchStore.results.map((img: IImageProps) => {
            return (<Image src={img.thumbnailUrl} key={img.thumbnailUrl} onClick={() => this.handleClick(img)} />);
        });

        return (
            <div>
                <StackGrid monitorImagesLoaded={true} duration={0}>
                    {cards}
                </StackGrid>
                <ImageDetailView searchStore={this.props.searchStore} />
            </div>
        );
    }

    @action
    handleClick(img: IImageProps) {
        console.log("Selected image " + img.thumbnailUrl);
        this.props.searchStore.selectedImage = img;
    }
}
