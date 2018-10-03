import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators/map';
import { filter } from 'rxjs/operators/filter';
import * as _ from 'lodash';

import { Blog } from '../model/blog';
import * as fromBlog from '../reducer/blog.reducer';
import * as BlogActions from '../actions/blog.actions';
import { FirebaseService } from '../../shared/firebase.service';

@Injectable()
export class BlogService {
  blogs: Blog[];
  serverUrl: string = 'http://localhost:3000';
  blogsCollection;

  constructor(
    private http: HttpClient,
    private store: Store<fromBlog.State>,
    private firebaseService: FirebaseService
  ) {
    this.blogsCollection = firebaseService.db.collection('blogs');
  }

  loadAllBlogsInfo(): Observable<any> {
    return from(this.blogsCollection.orderBy('order').get()).pipe(
      filter((querySnapshot: any) => querySnapshot.docs.length > 0),
      map((querySnapshot: any) => {
        let allBlogIds = _.map(querySnapshot.docs, (doc: any) => doc.id);
        let allBlogCount = querySnapshot.size;
        return { allBlogCount, allBlogIds };
      }));
  }

  loadOneBlog(blogId: string): Observable<Blog> {
    return from(this.blogsCollection.doc(blogId).get())
      .pipe(
        map((documentSnapshot: any) => new Blog({ id: documentSnapshot.id, ...documentSnapshot.data() })));
  }

  loadAtPage(startAtId: string, numberPerPage: number): Observable<Blog[]> {
    return this.createObservable(this.blogsCollection.orderBy('order').startAt(startAtId).limit(numberPerPage).get());
  }

  createObservable(promise: any): Observable<Blog[]> {
    return from(promise).pipe(
      filter((querySnapshot: any) => querySnapshot.docs.length > 0),
      map((querySnapshot: any) => _.map(querySnapshot.docs, doc => new Blog({ id: doc.id, ...doc.data() }))));
  }
}