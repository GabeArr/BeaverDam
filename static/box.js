
// This class represents the box at a particular frame of one thing
class Box {

    constructor(thing, frame, x, y, w, h, interpolated = true) {
        this.thing = thing; // The parent thing object that owns this keyframe
        this.frame = frame;
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;

        // true if interpolated, meaning if modified we must insert this back into parent thing as a new keyframe
        this.interpolated = interpolated;
    }

    static toJson(box) {
        if (box.interpolated) {
            return undefined;
        }
        return {
            x: box.x,
            y: box.y,
            w: box.w,
            h: box.h,
            frame: box.frame,
        };
    }

    static fromJson(json, thing) {
        return new Box(thing, json.frame, json.x, json.y, json.w, json.h, false);
    }

    // These getters and setters allow us to insert the keyframe into its parent
    // thing if it's modified
    get x() {return this._x;}
    set x(value) {
        this.modified();
        this._x = value;
    }
    get y() {return this._y;}
    set y(value) {
        this.modified();
        this._y = value;
    }
    get w() {return this._w;}
    set w(value) {
        this.modified();
        this._w = value;
    }
    get h() {return this._h;}
    set h(value) {
        this.modified();
        this._h = value;
    }

    modified() {
        if (this.interpolated) {
            this.thing.insertKeyframe(this);
            this.interpolated = false;
        }
    }

    /**
     * Checks if my is close to the top border of the box.
     * @param my The y coordinate.
     * @returns {boolean}
     */
    withinTop(my) {
        return (this.y + 2 >= my) && (this.y - 2 <= my)
    }

    withinBottom(my) {
        return (this.y + this.h + 2 >= my) && (this.y + this.h - 2 <= my)
    }

    withinRight(mx) {
        return (this.x + this.w + 2 >= mx) && (this.x + this.w - 2 <= mx);
    }

    withinLeft(mx) {
        return (this.x + 2 >= mx) && (this.x - 2 <= mx);
    }

    /**
     * Draws the box onto the canvas by modifying ctx attributes.
     * @param ctx The context of the canvas to be drawn on.
     */
    draw(ctx) {
        ctx.fillStyle = this.thing.fill;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    /**
     * Checks if (mx, my) is within the box. This will return false
     * if (mx, my) is within  the border. We use minX, maxX, minY, and maxY
     * in the event that there is a negative w or h.
     * @param mx The x coordinate.
     * @param my The y coordinate.
     * @returns {boolean}
     */
    contains(mx, my) {
        var minX = Math.min(this.x, this.x + this.w) - 2;
        var maxX = Math.max(this.x, this.x + this.w) + 2;
        var minY = Math.min(this.y, this.y + this.h) - 2;
        var maxY = Math.max(this.y, this.y + this.h) + 2;
        return (minX <= mx) && (maxX >= mx) &&
            (minY <= my) && (maxY >= my);
    }

    /**
     * Checks if (mx, my) falls within any of the borders.
     * @param mx The x coordinate.
     * @param my The y coordinate.
     * @returns {*} The border number if possible, false otherwise.
     */
    withinBorder(mx, my) {
        //Checks if this.within border
        if (this.withinTop(my) && this.withinLeft(mx)) {
            return Box.border.TOPLEFT;
        } else if (this.withinTop(my) && this.withinRight(mx)) {
            return Box.border.TOPRIGHT;
        } else if (this.withinBottom(my) && this.withinRight(mx)) {
            return Box.border.BOTTOMRIGHT;
        } else if (this.withinBottom(my) && this.withinLeft(mx)) {
            return Box.border.BOTTOMLEFT;
        } else if (this.withinTop(my)) {
            return Box.border.TOP;
        } else if (this.withinLeft(mx)) {
            return Box.border.LEFT;
        } else if (this.withinRight(mx)) {
            return Box.border.RIGHT;
        } else if (this.withinBottom(my)) {
            return Box.border.BOTTOM;
        } else {
            return false;
        }
    }

    /**
     * Moves the Box to the right by x_offset.
     * @param x_offset Distance to the right to be moved.
     */
    moveRight(x_offset) {
        this.w = x_offset - this.x;
    }

    moveLeft(x_offset) {
        this.w += this.x - x_offset;
        this.x = x_offset;
    }

    moveUp(y_offset) {
        this.h += this.y - y_offset;
        this.y = y_offset;
    }

    moveDown(y_offset) {
        this.h = y_offset - this.y;
    }

    /* returns a copy of this with frame = new_frame */
    interpolated_copy(new_frame) {
        return new Box(this.thing, new_frame, this._x, this._y, this._w, this._h, true);
    }

    /**
     * Determines if the mouse is on a corner. If not, returns false, else 
     * returns which of the four corners the mouse is on.
     * @param mx the x-coordinate of the mouse
     * @param my the y-coordinate of the mouse.
     */
     whichCorner(mx, my) {
        var minX = Math.min(this.x, this.x + this.w);
        var maxX = Math.max(this.x, this.x + this.w);
        var minY = Math.min(this.y, this.y + this.h);
        var maxY = Math.max(this.y, this.y + this.h);
        if ((minY + 2 >= my) && (minY - 2 <= my) && (maxX + 2 >= mx) && (maxX - 2 <= mx)) {
            return Box.corner.BOTTOMRIGHT;
        }  else if ((maxY + 2 >= my) && (maxY - 2 <= my) && (minX + 2 >= mx) && (minX - 2 <= mx)) {
            return Box.corner.TOPLEFT;
        } else if ((minY + 2 >= my) && (minY - 2 <= my) && (minX + 2 >= mx) && (minX - 2 <= mx)) {
            return Box.corner.BOTTOMLEFT;
        } else if ((maxY + 2 >= my) && (maxY - 2 <= my) && (maxX + 2 >= mx) && (maxX - 2 <= mx)) {
            return Box.corner.TOPRIGHT;
        } else {
            return false;
        }
    }

    /**
     * Changes the cursor to one of the four bidirectional resize cursors, depending on which 
     * side or corner of a box the mouse is on.
     * @param mx the x-coordinate of the mouse
     * @param my the y-coordinate of the mouse.
     */
    doubleArrow(border, corner) {
        if (corner === Box.corner.BOTTOMRIGHT || corner === Box.corner.TOPLEFT) {
            document.body.style.cursor = 'nesw-resize';
        } else if (corner === Box.corner.BOTTOMLEFT || corner === Box.corner.TOPRIGHT) {
            document.body.style.cursor = 'nwse-resize';
        } else if (border === Box.border.TOP || border === Box.border.BOTTOM){
            document.body.style.cursor = 'ns-resize';
        } else if (border === Box.border.LEFT || border === Box.border.RIGHT) {
            document.body.style.cursor = 'ew-resize';
        }
    }
}

/**
 * The values corresponding with each border.
 */
Box.border = {
    TOP: 1,
    LEFT: 2,
    RIGHT: 3,
    BOTTOM: 4,
    TOPLEFT: 5,
    TOPRIGHT: 6,
    BOTTOMLEFT: 7,
    BOTTOMRIGHT: 8
}

/**
 * The values corresponding with each corner. This differs from Box.border in that these 
 * values are based on what is considered topleft, topright, bottomleft, and bottomright
 * regardless of how a user drags a box.
 */
Box.corner = {
    TOPLEFT: 1,
    TOPRIGHT: 2,
    BOTTOMLEFT: 3,
    BOTTOMRIGHT: 4
}
