import { StyloliteInterface } from "./StyloliteInterface"

/**
 * 
 * A compaction band is represented by a plane. Its orientation in space is defined by three parameters, as follows:
 *      Strike: clockwise angle measured from the North direction [0, 360)
 *      Dip: vertical angle, measured downward, between the horizontal and the line of greatest slope in an inclined plane [0, 90]
 *      Dip direction: (N, E, S, W) or a combination of two directions (NE, SE, SW, NW).
 *
 * The cost method is inherited from StyloliteInterface as a compaction band is considered to be oriented perpendicularly to Sigma 1
 * @category Data
 */

export class CompactionBand extends StyloliteInterface {
}
