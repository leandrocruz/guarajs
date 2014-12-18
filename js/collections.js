define(function() {
    var collections = {};

    // --- Set ---------------------------------------------------------- //

    collections.Set = function() {
        this.array = [];
    };

    collections.Set.prototype.size = function() {
        return this.array.length;
    };

    collections.Set.prototype.add = function(element) {
        if(!this.contains(element)) {
            this.array.push(element);
        }
    };

    collections.Set.prototype.contains = function(element) {
        for(var index = 0; index < this.array.length; index++) {
            if(element == this.array[index]) {
                return true;
            }
        }
        return false;
    };

    collections.Set.prototype.toArray = function(element) {
        return this.array.slice(0);
    };

    return collections;
});
