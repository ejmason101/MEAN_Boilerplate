import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscribable, Subscription } from 'rxjs';

import { NewsService } from './news.service';
import { News } from 'src/assets/interfaces';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'admin-manage-news',
  templateUrl: './manage-news.component.html',
  styleUrls: ['./manage-news.component.css']
})
export class ManageNewsComponent implements OnInit, OnDestroy {

  enteredContent = "";
  enteredTitle = "";

  news: News;
  isLoading = false;
  mode = 'create';
  private newsId: string;
  private authStatusSub: Subscription;
  private newsSub: Subscription;

  public newsList: News[] = [];
  // private newsList: News = [];

  constructor(
    private newsService: NewsService,
    public authService: AuthService
  ) { }

  ngOnInit() {

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }      
    );
    

    this.newsService.getNews();
    console.log("news items:");
    this.newsSub = this.newsService.getNewsUpdateListener()
        .subscribe((news: News[]) => {
            console.log('news subscription updated with new values!');
            this.isLoading = false;
            this.newsList = news;
    });
    console.log(this.newsList);
    
  }

  ngOnDestroy() {
    this.newsSub.unsubscribe();
  }

  onSaveNews(form: NgForm) {
    console.log('onSaveNews() --> saving news article');
    if(form.invalid) {
        return;
    }

    this.isLoading = true;

    if (this.mode == 'create') {
        console.log('creating new News Article');
        this.newsService.addNewsArticle(form.value.title, form.value.content);
        form.resetForm();
    } else if(this.mode == 'edit') {
      console.log('updating old News Article');
      this.newsService.updateNewsArticle(
        this.news.id,
        form.value.title,
        form.value.content
      );
      
      this.mode = 'create';
      this.news = null;
      this.newsId = null;
      form.resetForm();
    }

  }

  onCreateNewsPrep(form: NgForm) {
    // This will clear out the edit panel to a virgin state, ready to create a new news artice
    this.mode = 'create';
    this.news = null;
    this.newsId = null;
    form.resetForm();
  }

    // FOR ADMIN-PANEL VIEW/EDIT NEWS POSTS

    loadNewsForEdit(id: string){
      // change mode --> 'edit'
      // search newslist for article with id == this
      // set news to the news artcile to edit
      console.log('loading news for edit');
      this.mode = 'edit';
      let editNewsIndex = this.newsList.findIndex(n => n.id === id);
      this.news = this.newsList[editNewsIndex];
      this.newsId = this.news.id; 
  }

  onDeleteNews(form: NgForm) {
    // only have the option if the article is in edit mode
    // use this.news.id and send that to newsService to delete it
    console.log('current news id in edit box:');
    console.log(this.newsId);
    if(!this.newsId) {
      return;
    }
    else {
      this.newsService.deleteNewsArticle(this.newsId);
      this.mode = 'create';
      form.resetForm();
    }
    
  
  }

}
