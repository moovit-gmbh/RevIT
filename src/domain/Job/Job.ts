export interface Job {
    id: string
    createDate: string
    creator: string
    custom: []
    dest: string
    groups: []
    name: string
    namespace: string
    status: string
    tile: {size: number, numberOfFramesTile: number, scaleFactor:number}
    tokens: []
    type: string,
    tileURL: string,
    metadata: {Width: number}
    slider: number
}
