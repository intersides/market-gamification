# market - gamification POC
###description:
I approached this simple project in 3 stage development.

1. The first is a prototype approach. Pure and essential JavaScript that alloed me to play with the concept and try ideas.

    It's placed in the **level-0-prototype** directory: To run it:
    
    ```
    cd ./level-0-prototype
    npm install
    node main.js
    ```
    The output is not interesting and does not match the final requirements. 
    
    This part of the project could be ignored.

2. **level-1-core** contains the code implementation proper to the assignment. And some basic Unit-testing.
    
     ```
     cd ./level-1-core
     npm install
     node main.js
     ```
     
     The output is try to matches the test expectations.
     To run the Mocha unit tests:
     
      ```
      cd ./level-1-core
      npm install
      npm test
      ```
      
3. **level-2-client-server** is a gamification of the assignment. It is a NodeJS express app, serving an HTML5 
CSS3 (SCSS) application. This is a "stretch" meant to implement a typical RESTful client server architecture without
any external framework (except for client side jQuery used for ajax wrapper and creating dynamic HTML fragments).

    This app has been tested only on the latest Chrome and uses some ECMAScript 6 functionalities such arrow functions, 
    Promises, **let** etc...
    
    The server-side uses some more ECMAScript 6 stuff such the new class constructor.
    
    I developed with  **NodeJS v5.6.0**  and I am using port 3000 to run the express http server.
    
    ```
    cd ./level-2-client-server
    npm install
    node main
    ```
    
    Then open a Chrome tab and navigate to ***http://localhost:3000***
    
    Press the ***let cart in*** to bring a new cart in the shop. Once it stops you can drag and drop any of the 4 items.
    Dragging might be changed soon because it does not look right and it is too slow. I will replace it with clicking on an item to be added tot he cart and I will add an item counter as well.
    At any time you can click the ***check out*** button under the cart to send the shopping basket to the counter. 
    It will automatically send the items to the server for receipt calculation and the it will be removed. The receipt will be added to the receipts list under the counter and it will also show the receipt in a modal pop-up.
    Once the receipt it is closed it can be reopened by clicking it from the list under the counter.
    
    
![snap01](https://cloud.githubusercontent.com/assets/3665812/24071672/2ad4d45a-0bd8-11e7-853b-eb051c543669.jpeg)
![test-gamification](https://cloud.githubusercontent.com/assets/3665812/24071673/2adca158-0bd8-11e7-9b9e-0e907fcd64d5.jpeg)
    
