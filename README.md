# Softdev_FinalProject
A Calendar to rise an activity with your friends!

### Quick Description
|Front-end|Back-end|  Description|
|---|---|---|
|1. Login |      | 按下LOGIN跳出FB授權，偵測是否是新使用者，是的話更新User[]|  
|2. Index |   | 根據UserID得到其所擁有的ActivityID[]|
|3. Activity|  |根據Index頁點選的ActivityID顯示對應的資訊|
   
### Related Links
[Schedule](https://docs.google.com/spreadsheets/d/1GxFBWrU8EeRcVnmUgGawMmm-SkN5xOC_EGeLNZuciG4/edit#gid=0) > Google Excel  
[Proposal](https://docs.google.com/presentation/d/1vIZllEucLzMFveREy1tzNzQ3Ns_4z9EY_lqPMFy2E8I/edit#slide=id.g1957550c04_0_0)  > Google ppt


---  

### DS & TABLE
  - user_id[]
   - activity_id[]   ＊
   - FB api related...
  
  - activity[]
   - user_id[]
   - name (title)
   - date[]
   - description
   - vote_id[]    ＊
  
  - vote[]
   - activity_id
   - option[]  (date or normal options)
   - deadline
  
  ＊ : 要進一步連結到另一個Table

### More Detailed Task Table

|頁面|Functions|Data & Table|Description|Possible issues|
|---|---|---|---|---|
|**Login**|||新的使用者，更新user_id[]|使用者在別處移除對此網頁的授權|
|**Index**|||Know user_id||
||Buttons||創活動、登出，創活動: Add new activity & Goto Activity.html|登出: Session處理|  
||已有的活動列表|user_id->activity[]|根據user_id撈取activity[]||  
||使用者的月曆||同上，撈出其中date[]資料顯示有活動，點擊日期頁面跳轉至此Activity.html|正在詢問有空的日期之顯示|
||最近的活動||同上，根據date[]排序離目前最近的前N個活動名稱，點擊可跳轉||
||邀請朋友||FB api related||
|**Activity**|||||
||Buttons||||
||||Edit||
||||Add||
||||Who||
||||Quit||
||月曆||||
||舉辦投票||||
||留言板||||


### GridFS Links:
[GridFS API](http://mongodb.github.io/node-mongodb-native/2.2/tutorials/gridfs/streaming/)   
[GridFS Docunentation1](https://docs.mongodb.com/manual/core/gridfs/#use-gridfs)   
[GridFS Docunentation2](https://docs.mongodb.com/manual/applications/drivers/)   
[GridFS backend <-> HTML frontend](https://medium.com/@patrickshaughnessy/front-to-back-file-uploads-using-gridfs-9ddc3fc43b5d#.qz334q5ih)



