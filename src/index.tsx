import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {action} from 'mobx';
import * as mobx from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import * as fetchJsonp from 'fetch-jsonp'
import * as Rx from 'rxjs'
import { Debounce } from 'lodash-decorators';
import {Header, Modal, Image, Input, Container, Card, Label, Divider} from 'semantic-ui-react'
import StackGrid from 'react-stack-grid'
import * as moment from 'moment'

mobx.useStrict(true)

//TODO: Comments, single search in flight

class SearchStore {
    @observable results : IImageProps[] = [];
    @observable selectedImage : IImageProps | null;
    requests = new Rx.Subject<any>();
    @observable isSearching = false;

    constructor(){
        // Chain of requests, switchMap cancels the previous request
        this.requests.switchMap((searchString:string) => {
            return Rx.Observable.fromPromise<IImageProps[]>(
                this.performSearch(searchString)
            )
            .catch(() => Rx.Observable.empty());
        })
        .subscribe(action((results:IImageProps[]) => {
            this.results = results;
            this.isSearching = false;
        }));
    }

    public search(searchString:string){
        console.log("Searching:" + searchString);
        this.requests.next(searchString)
    }

    @action
    private performSearch(searchString: string) : Promise<IImageProps[]>{
        this.selectedImage = null;
        if (!searchString){
            return Promise.resolve([]);
        }
        this.isSearching = true;
        var terms = searchString.split(" ").map(term => encodeURIComponent(term));
        var tagQuery  = "tags=" + terms.join(",");
        return fetchJsonp('https://api.flickr.com/services/feeds/photos_public.gne?format=json&' + tagQuery, {
            jsonpCallback: 'jsoncallback'
        })
        .then(response => response.json())
        .then((json:any) => {
            console.log("Received results for " + json.link)
            return json.items.map((result: any) : IImageProps => {
                return {
                    key: result.link,
                    title: result.title,
                    thumbnailUrl: result.media.m,
                    originalUrl: result.link,
                    author: result.author.replace("nobody@flickr.com (\"", "").replace("\")", ""),
                    date: moment(result.date_taken),
                    tags: result.tags.split(" ")
                }
            });
        });
    }
    
}

interface ISearchProps {
    searchStore: SearchStore
}


class RootView extends React.Component {

    render(){
        var store = new SearchStore();
        return (
            <div>
                <Container textAlign="center">
                    <SearchBoxView searchStore={store} />
                </Container>
                <Divider />
                <SearchResultsView searchStore={store} />
            </div>
        );
    }
}


@observer
class SearchBoxView extends React.Component<ISearchProps, any> {


    render() {
        return (
            <div>
               <Input 
                type="text"
                icon="search"
                size="huge"
                iconPosition="left"
                loading={this.props.searchStore.isSearching}
                onChange={ this.handleChange.bind(this) } 
                placeholder="Search..."
                />
            </div>
        );
     }

     
     handleChange(e:React.FormEvent<HTMLInputElement>) {
        // HACK: Seems like this should be in the framework but can't find an integrated debounce
        e.persist(); 
        this.handleChangeDebounced(e.currentTarget.value);
      }

      @Debounce(200)
      handleChangeDebounced(newValue: string){
        this.props.searchStore.search(newValue);
      }
};


@observer
class SearchResultsView extends React.Component<ISearchProps, any>{


    render() {
        var cards = this.props.searchStore.results.map((img: IImageProps) => {
            return  (<Image src={img.thumbnailUrl} key={img.thumbnailUrl} onClick={() => this.handleClick(img)} />);
        });

        return (
            <div>
            <StackGrid monitorImagesLoaded={true} duration={0}>
                {cards}
            </StackGrid>
            <ImageDetailView searchStore={this.props.searchStore}/>
            </div>
        );
     }

    @action
     handleClick(img: IImageProps){
         console.log("Selected image " + img.thumbnailUrl);
         this.props.searchStore.selectedImage = img;
     }

    
}

interface IImageProps {
    key: string
    title: string
    thumbnailUrl: string
    originalUrl: string
    author: string
    date: moment.Moment
    tags: string[]
}

@observer
class ImageDetailView extends React.Component<ISearchProps, any>{

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

console.log("Starting")
ReactDOM.render(<RootView />, document.getElementById('root'));
