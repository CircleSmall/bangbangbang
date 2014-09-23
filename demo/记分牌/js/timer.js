var timer = (function() {
    /*
     *计时器
     */

    function timer () {
        
        this.html = '<section class="timer"><div>' + //
                        
                    '<span>00</span>:<span>00</span><span>00</span>' + //
                    
                    '</div><div>' + //

                    '<button class="start">开始</button> <button class="reset">清零</button>' + //

                    '</div> </section>' ;//

    }
     

    return timer;

})()