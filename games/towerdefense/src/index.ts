import * as MoroboxAIGameSDK from 'moroboxai-game-sdk';

export class TowerDefense extends MoroboxAIGameSDK.GameInstance
{
    public help(): string {
        return 'TowerDefense game\n' +
        'outputs:\n' +
        '- screen_size: {x: screen width, y: screen height}\n' +
        '- pos: {x: horizontal position, y: vertical position}\n' +
        '- dir: {x: horizontal direction, y: vertical direction}\n' +
        'inputs:\n' +
        '- horizontal: horizontal speed\n' +
        '- vertical: vertical speed';
    }

    public output(key: string, val?: any): any {
        return val;
    }

    public input(key: string, val: any): void {
    }
}
