import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface GroundScheme {
    id: string;
    type: string;
    name: string;
    index: number;
}

export interface BuildingScheme {
    id: string;
    name: string;
    rent: number;
    score: number;
    color: string;
}

export interface ChanceScheme {
    id: string;
    type: string;
    name: string;
    coins: number;
}

