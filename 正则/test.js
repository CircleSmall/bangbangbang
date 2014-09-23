//正则效率测试：
var startTime = new Date().getTime();
var matchs = /^(a+)+$/.exec("aaaaaaaaaaaaaaaaaaaaaaaaaaaX");
var endTime = new Date().getTime();
alert(endTime - startTime);


// 结果：chrome 1311		ie 14652    firefox 直接卡死

// NFA和DFA的引擎是有区别的。js/perl/php/java/.net都是NFA引擎。
// 而DFA与NFA机制上的不同带来5个影响：
// 1. DFA对于文本串里的每一个字符只需扫描一次，比较快，但特性较少；NFA要翻来覆去吃字符、吐字符，速度慢，但是特性丰富，所以反而应用广泛，当今主要的正则表达式引擎，如Perl、Ruby、Python的re模块、Java和.NET的regex库，都是NFA的。
// 2. 只有NFA才支持lazy和backreference（后向引用）等特性；
// 3. NFA急于邀功请赏，所以最左子正则式优先匹配成功，因此偶尔会错过最佳匹配结果；DFA则是“最长的左子正则式优先匹配成功”。
// 4. NFA缺省采用greedy量词(就是对于/.*/、/\w+/这样的“重复n”次的模式，以贪婪方式进行，尽可能匹配更多字符，直到不得以罢手为止)，NFA会优先匹配量词。
// 5. NFA可能会陷入递归调用的陷阱而表现得性能极差。

// backtracking（回朔）
// 当NFA发现自己吃多了，一个一个往回吐，边吐边找匹配，这个过程叫做backtracking。由于存在这个过程，在NFA匹配过程中，特别是在编写不合理的正则式匹配过程中，文本被反复扫描，效率损失是不小的。明白这个道理，对于写出高效的正则表达式很有帮助。

// 而对于Javascript中的正则来说, 应该是优先匹配量词, 导致了很深的递归, 形成了性能问题…