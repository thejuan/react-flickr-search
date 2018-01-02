import {observable} from 'mobx';
import {action} from 'mobx';
import * as fetchJsonp from 'fetch-jsonp'
import * as Rx from 'rxjs'
import * as moment from 'moment'

export interface IImageProps {
  key: string
  title: string
  thumbnailUrl: string
  originalUrl: string
  author: string
  date: moment.Moment
  tags: string[]
}

export interface ISearchProps {
  searchStore: SearchStore
}


/** This is the primary Mobx store. Responsible for the state of a search (of which there can only be one) */
export class SearchStore {
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

  /** Search for the provided terms, cancels any previous in-progress search */
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

